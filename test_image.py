import sys
try:
    from PIL import Image
    import pytesseract
    img = Image.open('/Users/alvin/Documents/App_Dev/duolingo/prompt_material/05-home-and-tab-navigation.png')
    text = pytesseract.image_to_string(img)
    print("OCR Text:", text)
except Exception as e:
    print("Error:", e)
