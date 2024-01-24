import os
import requests
from zipfile import ZipFile
from io import BytesIO
import tkinter as tk
from tkinter import messagebox

def download_and_extract_zip(url):
    # Define the desktop path
    desktop_path = os.path.join(os.path.expanduser('~'), 'Desktop')

    try:
        # Make a GET request to the URL
        response = requests.get(url)

        if response.status_code == 200:
            # Extract the zip file to the desktop
            with ZipFile(BytesIO(response.content)) as zip_ref:
                zip_ref.extractall(desktop_path+"/CARNETERO")
            #show_popup("Actualizado!", f"Carnetero actualizado")
            print("Carnetero actualizado")
        else:
            #show_popup("Error", f"No se pudo actualizar el carnetero. Código de error: {response.status_code}")
            print("No se pudo actualizar el carnetero")
    except Exception as e:
        #show_popup("Error", f"An error occurred: {str(e)}")
        print(f"An error occurred: {str(e)}")
        
def show_popup(title, message):
    root = tk.Tk()
    root.withdraw()  # Hide the main window

    messagebox.showinfo(title, message)


if __name__ == "__main__":
    
    zip_url = 'https://cosas.ar/CARNETERO/CARNETERO.zip'

    download_and_extract_zip(zip_url)
