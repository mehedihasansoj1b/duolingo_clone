import sys
import os
import logging
from PIL import Image, UnidentifiedImageError
import pytesseract

if len(sys.argv) < 2:
    print("Usage: python test_image.py <path_to_image>")
    sys.exit(1)
    
image_path = sys.argv[1]

if not os.path.isfile(image_path):
    print(f"Error: The file '{image_path}' does not exist or is not a readable file.")
    sys.exit(1)
    
try:
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img)
    print("OCR Text:", text)
except FileNotFoundError as e:
    logging.exception(f"File not found: {e}")
except UnidentifiedImageError as e:
    logging.exception(f"Unidentified image error: {e}")
except pytesseract.pytesseract.TesseractError as e:
    logging.exception(f"Tesseract OCR error: {e}")
