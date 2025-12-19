import zipfile

def main():
    zip_path = "main.zip"
    try:
        with zipfile.ZipFile(zip_path, 'r') as z:
            file_list = z.namelist()
            
        md_files = [f for f in file_list if f.endswith('.md') or f.endswith('.mdx')]
        
        print(f"Found {len(md_files)} md/mdx files.")
        print("\nFirst 5 cleaned filenames:")
        
        cleaned_filenames = []
        for f in md_files:
            # Remove the first part of the path (up to the first slash)
            parts = f.split('/', 1)
            if len(parts) > 1:
                cleaned_name = parts[1]
                cleaned_filenames.append(cleaned_name)
            else:
                # Handle case where file might be at root of zip (unlikely for github archive)
                cleaned_filenames.append(f)
                
        for name in cleaned_filenames[:5]:
            print(name)
            
    except FileNotFoundError:
        print(f"Error: {zip_path} not found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
