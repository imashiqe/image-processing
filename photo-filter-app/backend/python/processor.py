import cv2
import sys
import numpy as np

input_path = sys.argv[1]
output_path = sys.argv[2]
filter_name = sys.argv[3]

image = cv2.imread(input_path)

if image is None:
    print("Could not read image")
    sys.exit(1)

if filter_name == "grayscale":
    output = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

elif filter_name == "blur":
    output = cv2.GaussianBlur(image, (15, 15), 0)

elif filter_name == "invert":
    output = cv2.bitwise_not(image)

elif filter_name == "sepia":
    kernel = np.array([
        [0.272, 0.534, 0.131],
        [0.349, 0.686, 0.168],
        [0.393, 0.769, 0.189]
    ])
    output = cv2.transform(image, kernel)
    output = np.clip(output, 0, 255).astype(np.uint8)
elif filter_name == "red_to_blue":
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    lower_red1 = np.array([0, 120, 70])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([170, 120, 70])
    upper_red2 = np.array([180, 255, 255])

    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    mask = mask1 + mask2

    output = image.copy()
    output[mask > 0] = [255, 0, 0]
    
else:
    output = image

cv2.imwrite(output_path, output)
print(output_path)

