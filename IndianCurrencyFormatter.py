from decimal import Decimal

def format_indian_currency(number_str):
    number = Decimal(number_str)
    integer_part, _, decimal_part = str(number).partition(".")
    
    integer_str = str(int(integer_part)) 
    result = []

    n = len(integer_str)
    if n > 3:
        result.append(integer_str[-3:])
        integer_str = integer_str[:-3]
        while len(integer_str) > 2:
            result.append(integer_str[-2:])
            integer_str = integer_str[:-2]
        if integer_str:
            result.append(integer_str)
        formatted_integer = ",".join(reversed(result))
    else:
        formatted_integer = integer_str

    return formatted_integer + ("." + decimal_part if decimal_part != "0" and decimal_part != "" else "")

def main():
    input_str = input("Enter a floating-point number: ")
    formatted = format_indian_currency(input_str)
    print("Formatted (Indian style):", formatted)

if __name__ == "__main__":
    main()
