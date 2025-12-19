from server import get_website_content

def main():
    test_url = "https://example.com"
    hw_url = "https://github.com/alexeygrigorev/minsearch"
    print(f"Fetching content from {hw_url}...")
    
    # Handle FastMCP decorator wrapper
    func = get_website_content
    if not callable(func):
        if hasattr(func, 'fn'):
            func = func.fn
        elif hasattr(func, '__wrapped__'):
            func = func.__wrapped__
    
    try:
        content = func(hw_url)
        print("\n--- Content Start ---")
        print(content[:500])
        print("--- Content End (truncated) ---")
        print(f"\nSuccessfully fetched {len(content)} characters.")
    except Exception as e:
        print(f"Error occurred: {e}")
        # Debug info if it fails
        print(f"Object type: {type(get_website_content)}")
        print(f"Dir: {dir(get_website_content)}")

if __name__ == "__main__":
    main()
