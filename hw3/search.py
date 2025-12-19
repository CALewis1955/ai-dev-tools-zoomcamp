import zipfile
import minsearch

def get_documents():
    zip_path = "main.zip"
    documents = []
    
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
    return documents

def build_index():
    documents = get_documents()
    index = minsearch.Index(
        text_fields=["content", "filename"],
        keyword_fields=[]
    )
    index.fit(documents)
    return index

def search(query):
    index = build_index()
    results = index.search(query, boost_dict={"filename": 1.5, "content": 1}, num_results=5)
    return results

if __name__ == "__main__":
    query = "demo"
    print(f"Searching for '{query}'...")
    results = search(query)
    for i, result in enumerate(results):
        print(f"{i+1}. {result['filename']}")
