import bisect

class PriceEntry:
    def __init__(self, price, year):
        self.price = price
        self.year = year

def find_minimum_loss(prices):
    n = len(prices)
    entries = [PriceEntry(prices[i], i) for i in range(n)]
    
    entries.sort(key=lambda x: -x.price)

    min_loss = float('inf')
    buy_year = sell_year = -1

    seen_years = []
    year_to_index = {}

    for entry in entries:
        idx = bisect.bisect_left(seen_years, entry.year)
        if idx > 0:
            prev_year = seen_years[idx - 1]
            loss = entry.price - prices[prev_year]
            if loss < min_loss:
                min_loss = loss
                buy_year = entry.year + 1
                sell_year = prev_year + 1

        bisect.insort(seen_years, entry.year)

    if buy_year != -1:
        print(f"Buy in year: {buy_year}")
        print(f"Sell in year: {sell_year}")
        print(f"Minimum Loss: {min_loss}")
    else:
        print("No valid loss scenario found.")

def main():
    n = int(input("Enter number of years: "))
    print("Enter prices for each year:")
    prices = list(map(int, input().split()))

    if len(prices) != n:
        print("Error: Number of prices does not match number of years.")
        return

    find_minimum_loss(prices)

if __name__ == "__main__":
    main()
