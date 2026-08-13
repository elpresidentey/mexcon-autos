PRODUCT IMAGE BULK UPLOAD
=========================

How to use:

1. Get photos of your products (real photos are best; one clear studio-style
   shot per product is already a huge win over the placeholder icon).

2. Organize them in this folder (scripts/bulk-images/):
     Option A (recommended, by part number):
       scripts/bulk-images/BP-MAZ-M3-F/001.jpg
       scripts/bulk-images/BP-MAZ-M3-F/002.webp
       ...
     Option B (filename = part number, OEM number, or a name fragment):
       scripts/bulk-images/1Y08-33-23Z.jpg
       scripts/bulk-images/brake pads front.jpg

   For multiple images, name files so natural sort gives the right order:
   001.jpg, 002.jpg ... (first image becomes the primary photo).

3. Preview what will upload (no changes):
     node scripts/bulk-upload-images.cjs --dry

4. Upload for real:
     node scripts/bulk-upload-images.cjs --apply

The tool matches by PART NUMBER first, then OEM number, then product-name
fragment — so folder/file names like "BP-MAZ-M3-F", "1Y08-33-23Z" or
"toyota corolla brake pads" all work.

After upload the product immediately has: gallery images on the customer page,
correct thumbnail on every card/list, and primary_image_id/url set.