from server import search

def main():
    query = "demo"
    print(f"Testing search tool with query: '{query}'")
    
    # Handle FastMCP decorator wrapper
    func = search
    if not callable(func):
        if hasattr(func, 'fn'):
            func = func.fn
        elif hasattr(func, '__wrapped__'):
            func = func.__wrapped__
            
    try:
        results = func(query)
        print("\nSearch Results:")
        print(results)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
