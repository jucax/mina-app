-- Add other_type column to properties table
-- This column will store custom property types when users select "Otro"

-- Add the other_type column
ALTER TABLE "public"."properties" 
ADD COLUMN "other_type" TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN "public"."properties"."other_type" IS 'Custom property type when property_type is "Otro"';

-- Update existing records where property_type contains "Otro: " to extract the other_type
UPDATE "public"."properties" 
SET "other_type" = SUBSTRING("property_type" FROM 6)  -- Remove "Otro: " prefix
WHERE "property_type" LIKE 'Otro:%';

-- Update property_type to just "Otro" for records that have the "Otro: " prefix
UPDATE "public"."properties" 
SET "property_type" = 'Otro'
WHERE "property_type" LIKE 'Otro:%';

-- Verify the changes
SELECT 
    id,
    property_type,
    other_type,
    created_at
FROM "public"."properties" 
WHERE "property_type" = 'Otro' 
ORDER BY "created_at" DESC 
LIMIT 10;
