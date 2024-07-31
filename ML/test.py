import pandas as pd;

df = pd.read_json('test.json',encoding="latin-1");

df.head();
corr_matrix = df.corr(numeric_only=True);
print(df["rayPct"].describe())

# ran = [ f'{letter}{num}' for letter in ['a','b','c'] for num in range(1,6)];
# print(ran)

# class Human:
#     def __init__(self,health):
#         self.health = health
#     def attack(self):
#         print(self.health) 


# class Warrior(Human):
#     def __init__(self,health,defense):
#         super().__init__(health)
#         self.defense = defense



# class Knight(Human):
#     def __init__(self,health,damage):
#         super().__init__(health)
#         self.damage = damage
    

# warrior = Warrior(50,7.2)
# knight = Knight(150,11)
# # human=Human()
# # human.attack()
# print(warrior.health)
# knight.health
