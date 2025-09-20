a = [3, "rohan", "sanaya", 9.33, False, True, "itscoder", 3]
b = (3, "rohan", "sanaya", 9.33, False, True, "itscoder", 3)
# abcd = ['a',"B", "b", "A", 'C', "c", ]
c = (3, 4, 1, 2, 2, 2, 4, 99, 1, 6, 20)
number = [
    4,
    2,
    7,
    11,
    9,
    99,
    1,
    209,
    187,
    3,
    4,
    53,
    992,
    300,
    1092,
    203,
    1029,
    1046,
    829,
    1057,
    9191,
    1060,
    1080,
]


""" Environment Methods
a.count(X)    it will return how many times X is repeated in list
a.index(X)    it will return in which index the first X exist in list
x in list     will return if x exist in list then true else false
len(a)        it will return length of list
min(list)     will return smalled number of list
max(list)     will return biggest number of list

Destructure:  ex. list = (2,3,6)
a,b,c = list
print(a,b,c)  # 2, 3, 6
"""


"""
0:
Strings Are Immutable (not Changable)
Arrays Are Mutable (Changable)
Tuples Are Immutable (not Changable)

For Array :::::::

1. Appeand   # like push method
a.append('its apeanded')

2. sort      # In str A>B>C then a>b>c , in int 1>2>3
number.sort()

3. reverse
a.reverse()

4. insert    # add Items at perticular index (index, item)
a.insert(2, 'its called')

5. pop.      # remove item which index is in method and Also Return the popped Item
a.pop(3)

6. Remove    # if removing item exist in array, it will remove item (ensure not Index's Item)
a.remove(3)

7. sum       # sum all the numbers in list
sum(a)       return the sum of a

"""




"""
For Tuples :::::::
"""


print(sum(c))

indexx = max(number)
# print(f"{indexx} is highest and on the {number.index(indexx)} index")

