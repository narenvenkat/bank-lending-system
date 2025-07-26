def compute_overlap(a_left, a_right, b_left, b_right):
    return max(0, min(a_right, b_right) - max(a_left, b_left))

def should_merge(pos1, pos2):
    l1, r1 = pos1
    l2, r2 = pos2
    len1 = r1 - l1
    len2 = r2 - l2
    overlap = compute_overlap(l1, r1, l2, r2)
    return overlap > 0.5 * len1 or overlap > 0.5 * len2

def merge_lists(list1, list2):
    merged = []
    i, j = 0, 0
    while i < len(list1) and j < len(list2):
        item1 = list1[i]
        item2 = list2[j]
        pos1 = item1["positions"]
        pos2 = item2["positions"]

        if should_merge(pos1, pos2):
            merged.append({
                "positions": pos1,
                "values": item1["values"] + item2["values"]
            })
            i += 1
            j += 1
        elif pos1[0] < pos2[0]:
            merged.append(item1)
            i += 1
        else:
            merged.append(item2)
            j += 1

    while i < len(list1):
        merged.append(list1[i])
        i += 1
    while j < len(list2):
        merged.append(list2[j])
        j += 1

    return merged

def read_list(n):
    lst = []
    for i in range(n):
        print(f"\nElement {i+1}:")
        left = int(input("  Enter left position: "))
        right = int(input("  Enter right position: "))
        values = input("  Enter values (space-separated): ").split()
        lst.append({"positions": [left, right], "values": values})
    return lst

def main():
    print("Enter List 1:")
    n1 = int(input("Number of elements in List 1: "))
    list1 = read_list(n1)

    print("\nEnter List 2:")
    n2 = int(input("Number of elements in List 2: "))
    list2 = read_list(n2)

    list1.sort(key=lambda x: x["positions"][0])
    list2.sort(key=lambda x: x["positions"][0])

    merged = merge_lists(list1, list2)

    print("\nMerged List:")
    for item in merged:
        print(item)

if __name__ == "__main__":
    main()