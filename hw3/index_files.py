import zipfile
import minsearch

def main():
    zip_path = "main.zip"
    documents = []
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as z:
            file_list = z.namelist()
            md_files = [f for f in file_list if f.endswith('.md') or f.endswith('.mdx')]
            
            for f in md_files:
                # Read content
                content = z.read(f).decode('utf-8')
                
                # Clean filename
                parts = f.split('/', 1)
                filename = parts[1] if len(parts) > 1 else f
                
                documents.append({
                    "content": content,
                    "filename": filename
                })
        
        print(f"Prepared {len(documents)} documents for indexing.")
        
        # Indexing with minsearch
        # Step 4: Index these files with minsearch. Put the text content in "content" field and filename in "filename"
        # Step 5: "Use ... to learn how to use minsearch" -> Implied usage here.
        
        index = minsearch.Index(
            text_fields=["content", "filename"],
            keyword_fields=[]
        )
        
        index.fit(documents)
        print("Indexing complete.")
        
        # Verify with a simple search (implied verification, also pre-step 6)
        query = "demo"
        results = index.search(query, boost_dict={"filename": 1.5, "content": 1}, num_results=1)
        
        print(f"\nTest search for '{query}':")
        for result in results:
            print(f"- {result['filename']}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
