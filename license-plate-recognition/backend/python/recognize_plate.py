import cv2
import pytesseract
import sys
import os
import numpy as np

# If using Windows, uncomment and update path:
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

input_path = sys.argv[1]
output_path = sys.argv[2]

image = cv2.imread(input_path)

if image is None:
    print("Could not read image")
    sys.exit(1)

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
filtered = cv2.bilateralFilter(gray, 11, 17, 17)
edged = cv2.Canny(filtered, 30, 200)

contours, _ = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
contours = sorted(contours, key=cv2.contourArea, reverse=True)[:15]

plate_contour = None

for contour in contours:
    perimeter = cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, 0.018 * perimeter, True)

    if len(approx) == 4:
        plate_contour = approx
        break

output = image.copy()
plate_text = "No plate detected"

if plate_contour is not None:
    cv2.drawContours(output, [plate_contour], -1, (0, 255, 0), 3)

    x, y, w, h = cv2.boundingRect(plate_contour)
    plate = gray[y:y + h, x:x + w]

    if plate.size > 0:
        plate = cv2.resize(plate, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        plate = cv2.threshold(plate, 150, 255, cv2.THRESH_BINARY)[1]

        custom_config = r'--oem 3 --psm 8'
        text = pytesseract.image_to_string(plate, config=custom_config)

        cleaned = "".join(ch for ch in text if ch.isalnum() or ch in ["-", " "]).strip()
        if cleaned:
            plate_text = cleaned

        cv2.putText(
            output,
            plate_text,
            (x, max(y - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (0, 255, 0),
            2
        )

cv2.imwrite(output_path, output)
print(plate_text)