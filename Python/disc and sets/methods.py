a = {"harry": 90, "rohan": 59}
b = set()

# set
# set is non-repeatable list that never repeat any thing such like numbers and string

""" an empty set make like: 
var = set()          and use like dict: 
s = {3,4,1,3,'fi','bi','fi','ee'}

"""



# 1. adding key and value

# t = '43'
# a[f'{t}'] = t
""" For Creating Key In Dictionary and f'{variable}' makes new key """


# 2. items()

# dict.items()     # return all items in dictionary in the list form
# print(a.items())
""" For getting all items in dictionary """


#3 . keys()

# dict.keys()       # return all keys of dictionary in the list form
# print(a.keys())
""" For getting all keys in dictionary """


#4 . values()

# dict.values()       # return all values of dictionary in the list form
# print(a.values())
""" For getting all values in dictionary """


#5 . update           # (rule: must write under 1 object)

# a.update({'harry':45,'harsh':70})     # dict.includes(item) ? update item : add item
# print(a)
""" if dict includes item then update and if not exist then add """


#6 . get           # (rule: must write under 1 object)

# var =  a.get('harry')    # dict.includes(item) ? return value : return none
# print(var)
""" if dict includes item then return value and if not exist then None (ensure normal will give error like 'a[harry]' )"""


#7 . pop          

# var =  a.pop('harry')    # pop remove the key,value defined x under pop(x) and return value
# print(var)
""" pop remove the key value from dict and return value"""


#7 . pop          

# var =  a.pop('harry')    # pop remove the key,value defined x under pop(x) and return value
# print(var)
""" pop remove the key value from dict and return value"""







