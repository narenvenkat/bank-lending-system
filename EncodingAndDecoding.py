def encode(message, shift):
    return shift_message(message, shift)

def decode(message, shift):
    return shift_message(message, -shift)

def shift_message(message, shift):
    result = []
    shift = shift % 26 # Since there are 26 alphabets

    for c in message:
        if c.isupper():
            shifted = chr((ord(c) - ord('A') + shift + 26) % 26 + ord('A'))
            result.append(shifted)
        elif c.islower():
            shifted = chr((ord(c) - ord('a') + shift + 26) % 26 + ord('a'))
            result.append(shifted)
        else:
            result.append(c)

    return ''.join(result)

def main():
    message = input("Enter message: ")
    shift = int(input("Enter shift length: "))

    encoded = encode(message, shift)
    decoded = decode(encoded, shift)

    print("\nEncoded message :", encoded)
    print("Decoded message :", decoded)

if __name__ == "__main__":
    main()
