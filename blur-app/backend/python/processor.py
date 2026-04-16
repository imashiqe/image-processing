import sys
import os
import cv2

if len(sys.argv) != 3:
    print("Usage: python processor.py <input_path> <output_path>")
    sys.exit(1)

input_path = sys.argv[1]
output_path = sys.argv[2]

if not os.path.exists(input_path):
    print("Input image not found")
    sys.exit(1)

image = cv2.imread(input_path)

if image is None:
    print("Could not read image")
    sys.exit(1)

blurred = cv2.GaussianBlur(image, (25, 25), 0)

saved = cv2.imwrite(output_path, blurred)

if not saved:
    print("Failed to save output image")
    sys.exit(1)

print("Done")
sys.exit(0)