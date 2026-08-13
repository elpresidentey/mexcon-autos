import { useState } from 'react';
import { supabase, uploadImage, STORAGE_BUCKETS } from '../../services/supabase';
import {
  Button,
  Card,
  LoadingSpinner,
  EmptyState,
} from '../../components/common';
import { validateImageFile } from '../../utils/validation';
import { CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PendingImage {
  id: string;
  fileName: string;
  url: string;
  path: string;
  productId: string;
  matchedByName: string | null;
}

interface ProductOption {
  id: string;
  name: string;
  part_number?: string;
  oem_number?: string;
  brandName?: string;
}

export const BulkImagesPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [assignedCount, setAssignedCount] = useState(0);

  const loadProducts = async () => {
    if (products.length > 0) return;
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, part_number, oem_number, brand:brands(name)')
        .order('name');
      if (error) throw error;

      const rows = (data || []) as unknown as Array<{
        id: string;
        name: string;
        part_number: string | null;
        oem_number: string | null;
        brand: Array<{ name: string }> | { name: string } | null;
      }>;
      setProducts(rows.map((p) => {
        const brand = Array.isArray(p.brand) ? p.brand[0] : p.brand;
        return {
          id: p.id,
          name: p.name,
          part_number: p.part_number || undefined,
          oem_number: p.oem_number || undefined,
          brandName: brand?.name,
        };
      }));
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const detectProduct = (fileName: string): ProductOption | null => {
    const stem = fileName.replace(/\.[^.]+$/, '').toLowerCase();
    if (!stem) return null;

    const byPart = products.find((p) => p.part_number && p.part_number.toLowerCase() === stem);
    if (byPart) return byPart;
    const byOem = products.find((p) => p.oem_number && p.oem_number.toLowerCase() === stem);
    if (byOem) return byOem;

    let best: ProductOption | null = null;
    let bestScore = 0;
    for (const p of products) {
      let score = 0;
      if (p.part_number && stem.includes(p.part_number.toLowerCase())) score = Math.max(score, p.part_number.length);
      if (p.oem_number && stem.includes(p.oem_number.toLowerCase())) score = Math.max(score, p.oem_number.length);
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return best && bestScore >= 4 ? best : null;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = '';
    if (!files || files.length === 0) return;

    await loadProducts();
    setIsUploading(true);
    const uploaded: PendingImage[] = [];
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        failed++;
        continue;
      }
      const result = await uploadImage(STORAGE_BUCKETS.PRODUCTS, file, 'bulk');
      if (!result) {
        toast.error(`${file.name}: upload failed`);
        failed++;
        continue;
      }
      const match = detectProduct(file.name);
      uploaded.push({
        id: crypto.randomUUID(),
        fileName: file.name,
        url: result.url,
        path: result.path,
        productId: match?.id || '',
        matchedByName: match?.name || null,
      });
    }

    setPending((prev) => [...prev, ...uploaded]);
    setIsUploading(false);
    if (uploaded.length > 0) {
      toast.success(`Uploaded ${uploaded.length} image(s)${failed ? `, ${failed} failed` : ''}`);
    } else if (failed > 0) {
      toast.error(`${failed} image(s) failed to upload`);
    }
  };

  const handleAssign = async () => {
    const toAssign = pending.filter((p) => p.productId !== '');
    if (toAssign.length === 0) {
      toast.error('No images have a product selected');
      return;
    }

    setIsAssigning(true);
    let ok = 0;
    const failures: string[] = [];

    for (const img of toAssign) {
      const product = products.find((p) => p.id === img.productId);
      if (!product) {
        failures.push(img.fileName);
        continue;
      }

      try {
        const { data: existing } = await supabase
          .from('product_images')
          .select('id')
          .eq('product_id', img.productId);

        const count = existing?.length || 0;
        const { data: row, error: insError } = await supabase
          .from('product_images')
          .insert({
            product_id: img.productId,
            path: img.path,
            url: img.url,
            alt_text: `${product.name} - Image ${count + 1}`,
            is_primary: count === 0,
            order_index: count,
          })
          .select()
          .single();

        if (insError) throw insError;

        if (count === 0 && row) {
          const { error: updError } = await supabase
            .from('products')
            .update({ primary_image_id: row.id, primary_image_url: row.url })
            .eq('id', img.productId);
          if (updError) throw updError;
        }
        ok++;
      } catch (error) {
        console.error('Error assigning image:', error);
        failures.push(img.fileName);
      }
    }

    setPending((prev) => prev.filter((p) => p.productId !== '' && !toAssign.includes(p)));
    setIsAssigning(false);
    setAssignedCount((c) => c + ok);

    if (ok > 0) toast.success(`Assigned ${ok} image(s) to products`);
    if (failures.length > 0) toast.error(`Failed for ${failures.join(', ')}`);
  };

  const removePending = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const clearAll = () => {
    if (window.confirm('Remove all pending images from this list? (Files stay in storage until assigned to a product.)')) {
      setPending([]);
    }
  };

  const assignedTotal = pending.filter((p) => p.productId !== '').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Bulk Image Assigner</h1>
          <p className="text-stone-600 mt-1">
            Upload product photos in one go — filenames matching a part number or OEM number auto-assign to that product.
          </p>
        </div>
        <label htmlFor="bulk-upload">
          <input
            id="bulk-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
          <Button
            as="span"
            leftIcon={<CloudArrowUpIcon className="w-5 h-5" />}
            isLoading={isUploading}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Images'}
          </Button>
        </label>
      </div>

      {/* Tip Card */}
      <Card className="p-5 bg-primary-50 border-primary-200">
        <h2 className="font-semibold text-primary-800 mb-1">Best results:</h2>
        <ul className="text-sm text-primary-700 space-y-1 list-disc list-inside">
          <li>Name files by part number or OEM number, e.g. <code className="font-mono">BP-MAZ-M3-F.jpg</code> or <code className="font-mono">1Y08-33-23Z_001.jpg</code></li>
          <li>First image of each product becomes the primary photo</li>
          <li>Uploading the same photo set again appends (does not duplicate)</li>
        </ul>
      </Card>

      {/* Pending assignments */}
      {assignedCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700">
          <CheckCircleIcon className="w-5 h-5" />
          {assignedCount} image(s) assigned to products this session.
        </div>
      )}

      {pending.length === 0 ? (
        <Card>
          <EmptyState
            title="No images to assign"
            description="Upload product photos above to get started"
            action={
              <label htmlFor="bulk-upload-empty">
                <input
                  id="bulk-upload-empty"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button as="span" leftIcon={<CloudArrowUpIcon className="w-5 h-5" />} isLoading={isUploading}>
                  Upload Images
                </Button>
              </label>
            }
          />
        </Card>
      ) : (
        <>
          {isLoadingProducts && <LoadingSpinner />}

          <Card className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pending.map((img) => (
                <div key={img.id} className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                  <div className="relative aspect-square bg-stone-100">
                    <img src={img.url} alt={img.fileName} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePending(img.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-stone-100"
                      title="Remove from list"
                    >
                      <XMarkIcon className="w-4 h-4 text-stone-600" />
                    </button>
                    {img.matchedByName && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-lg">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Matched
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-stone-500 font-medium truncate" title={img.fileName}>
                      {img.fileName}
                    </p>
                    <select
                      value={img.productId}
                      onChange={(e) =>
                        setPending((prev) =>
                          prev.map((p) => (p.id === img.id ? { ...p, productId: e.target.value } : p))
                        )
                      }
                      className={`w-full text-sm border rounded-lg px-3 py-2 ${
                        img.productId ? 'border-stone-300 bg-white' : 'border-amber-400 bg-amber-50'
                      }`}
                    >
                      <option value="">-- Select product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}{p.part_number ? ` (${p.part_number})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                {pending.length} pending, {assignedTotal} ready to assign
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={clearAll} disabled={isAssigning}>
                  Clear List
                </Button>
                <Button
                  onClick={handleAssign}
                  isLoading={isAssigning}
                  disabled={isAssigning || assignedTotal === 0}
                  leftIcon={<CheckCircleIcon className="w-5 h-5" />}
                >
                  {isAssigning ? 'Assigning...' : `Assign ${assignedTotal > 0 ? assignedTotal : ''} Image${assignedTotal === 1 ? '' : 's'}`}
                </Button>
              </div>
            </div>
            {assignedTotal === 0 && pending.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-amber-600">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Select a product for each image to assign
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};