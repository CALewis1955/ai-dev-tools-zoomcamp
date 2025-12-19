from fastmcp import FastMCP

mcp = FastMCP("Demo 🚀")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool
def get_website_content(url: str) -> str:
    """Get content of any web page using Jina Reader
    
    Args:
        url: The URL of the web page to fetch
    """
    import requests
    response = requests.get(f"https://r.jina.ai/{url}")
    return response.text

# Search initialization
import zipfile
import minsearch

def get_documents():
    zip_path = "main.zip"
    documents = []
    try:
        with zipfile.ZipFile(zip_path, 'r') as z:
            file_list = z.namelist()
            md_files = [f for f in file_list if f.endswith('.md') or f.endswith('.mdx')]
            for f in md_files:
                content = z.read(f).decode('utf-8')
                parts = f.split('/', 1)
                filename = parts[1] if len(parts) > 1 else f
                documents.append({
                    "content": content,
                    "filename": filename
                })
    except Exception as e:
        print(f"Error reading zip: {e}")
    return documents

# Initialize index lazily or globally? Global is fine for this demo.
_settings_index = None

def get_index():
    global _settings_index
    if _settings_index is None:
        documents = get_documents()
        _settings_index = minsearch.Index(
            text_fields=["content", "filename"],
            keyword_fields=[]
        )
        _settings_index.fit(documents)
    return _settings_index

@mcp.tool
def search(query: str) -> str:
    """Search the FastMCP documentation.
    
    Args:
        query: The search query string.
    """
    index = get_index()
    results = index.search(query, boost_dict={"filename": 1.5, "content": 1}, num_results=5)
    
    output = []
    for result in results:
        output.append(f"- {result['filename']}")
    
    return "\n".join(output)

if __name__ == "__main__":
    mcp.run()