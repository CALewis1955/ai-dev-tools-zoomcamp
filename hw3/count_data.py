from server import get_website_content

def main():
    url = "https://datatalks.club/"
    print(f"Fetching content from {url}...")
    
    # Handle FastMCP decorator wrapper
    func = get_website_content
    if not callable(func):
        if hasattr(func, 'fn'):
            func = func.fn
        elif hasattr(func, '__wrapped__'):
            func = func.__wrapped__
    
    try:
        content = func(url)
        # Count "data" (case-insensitive? usually implied, but let's check exact word or substring? 
        # User asked: Count how many times the word "data" appears
        # I'll count specific string "data" case-insensitive to be safe, or just "data" as requested.
        # "word" usually implies boundaries, but simple count is often what is expected. 
        # I will count the case-insensitive substring "data".
        
        count = content.lower().count("data")
        
        print(f"\nContent length: {len(content)}")
        print(f"The word 'data' appears {count} times.")
        
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    main()
