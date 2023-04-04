
# Union Types 


## What are Union Types?
Union type relations are used to model entities that can have multiple different types. Essentially, a union type allows you to combine two or more types into a single type, so that you can work with them as a group.

In TypeScript it can be something like this:

```typescript
type Activity = Video | Photo | Image
```
the type `Activity` is a union type that can represent a `Video`, a `Post` or a `Image` each with their own set of attributes.

## Union Types are useful in Databases

In the context of databases, union types are often called **Polymorphic Associations** which referes to the ability of an object to take on many forms. Idealy, in a polymorphic association a model can belong to a model of a set of possible models.

#### Let's look at a simple use case

Imagine you have a database for a payment system where a user can use different payment methods to pay for their favorite products. In the database you want to save a transaction record each time a user buy something on your website.

Let's say payment methods can include `Credit Card`, `PayPal` and `BankTransfer`. By using a union type, you could define a single `Transaction` type that can be of any of the mentioned payment methods, while still allowing you to work with each type of product in a type-safe way.

### How Union types/Polymorphic Associations can be modeled in plain **SQL**.

####  1) Using Separate Join Tables For Each Type
Going back to the transactions example, you may want to model each transaction with each possible payment method like this:

```sql
CREATE TABLE credicard_transaction (
  id     INT PRIMARY KEY,
  amount DECIMAL(10,2),
  credit_card_id INT,
  FOREIGN KEY (credit_card_id) REFERENCES credit_card(id)
)

CREATE TABLE paypal_transaction (
  id     INT PRIMARY KEY,
  amount DECIMAL(10,2),
  paypal_id INT,
  FOREIGN KEY (paypal_id) REFERENCES credit_card(id)
)
```
This solution is great in terms of enforcing referential integrity and proper database relations due to the effective use of foreign keys, and you can get away with this until you have more and more payment methods. Will you keep adding association tables for all of them? 
Additionally, joining multiple subtypes can be complex and may require multiple join statements which affect performance down the road.

#### 2) Multiple Foreign keys approach

Well, a better solution for a growing number of subtypes would be creating a separate foreign key column for each table that the single table can reference. This approach is also known as the Class Table Inheritance pattern.

Example: 
```sql
CREATE TABLE payment (
  id     INT PRIMARY KEY,
  amount DECIMAL(10,2),
  credit_card_id INT,
  paypal_id INT,
  bank_transfer_id INT,
  FOREIGN KEY (credit_card_id) REFERENCES credit_card(id),
  FOREIGN KEY (paypal_id) REFERENCES paypal(id),
  FOREIGN KEY (bank_transfer_id) REFERENCES bank_transfer(id),
  CHECK ((credit_card_id IS NOT NULL)::int + 
         (paypal_id IS NOT NULL)::int + 
         (bank_transfer_id IS NOT NULL)::int = 1)
```

This approach is easy to query and maintain and can handle a large number of subtypes with minimal changes to the schema. However, it results in many null values in the foreign key columns.  Additionally, the need for a CHECK constraint to ensure that each row belongs to exactly one subtype may not be supported by all database systems. 

#### 3) Single Polymorphic Association Table approach
This is also called a Single Join Table or polymorphic table. It usually works by adding two columns to a polymorphic table: an `owner_type` column, and an `owner_id` the ID of the row to retrieve based on `owner_type`.

Example:
```sql
CREATE TABLE payment (
  id     INT PRIMARY KEY,
  amount DECIMAL(10,2),
  payment_type_id INTEGER NOT NULL,
  payment_type TEXT NOT NULL,
);
```

This approach requires fewer tables than the separate join table approach, but it can be more difficult to query use bunch of UNIONs.

Another issue with this model is that the lack of relations would allow data to grow into invalid state and orphan records causing referential integrity issues.  However, we can use some CHECK and Constrains to get around those integrity issues. So, I believe this may be a safest obtion.

---

## What does a workaround with Prisma looks like for using union types?

Unfortunately, Prisma currently doesn't support union types or Polymorphic Associations. Since union types is a very demanding feature and needed in many applications, I'm going to show you different workarounds to work with union types in Prisma and TypeScript. 

Let's see another example of an e-commerce database where an `Item` can be a `Book` or `Movie`. First, we will see how to implement the **Multiple Foreign keys** approach in Prisma, then we will implement the **Single Polymorphic Association Table** approach. So go grab a cup of coffee because things are getting more interesting now ☕😄

### **1) Multiple Foreign keys approach** 
 Create a separate foreign key column for each subtype that the single table can reference. 
 
**Schema**:
```typescript
model  Item  {
  id        Int  @id  @default(autoincrement())
  itemType  String
  price     Int
  amount    Int
  book      Book?
  movie     Movie?
}

model  Book  {
  id            Int  @id  @default(autoincrement())
  title         String
  serialNumber  Int
  // reference the corresponding item
  itemId  Int   @unique
  item    Item  @relation(fields: [itemId], references: [id])
}

model  Movie  {
  id         Int  @id  @default(autoincrement())
  title      String
  director   String
  // reference the corresponding item
  itemId    Int   @unique
  item      Item    @relation(fields: [itemId], references: [id])
}
```
**Seed database**
```typescript
async function seed() {
  console.log(`Start seeding ...`);

  // create a book item
  const bookId = uuid();
  await prisma.$transaction([
    prisma.item.create({
      data: { id: bookId, amount: 20, price: 15, itemType: "Book" },
    }),
    prisma.book.create({
      data: { id: bookId, title: "Awesome Book", serialNumber: 123456789 },
    }),
  ]);

  // create a Movie
  const movieId = uuid();
  await prisma.$transaction([
    prisma.item.create({
      data: { id: movieId, amount: 10, price: 45, itemType: "Movie" },
    }),
    prisma.movie.create({
      data: { id: movieId, title: "Awesome Movie", director: "John Doe" },
    }),
  ]);
}
```
**Query all Items and return each item with it's correct type**
```typescript
import { Book, Item, Movie, PrismaClient } from  "@prisma/client";
const  prisma  =  new  PrismaClient();

type  BookOrMovie  =  Item  & { book:  Book; movie:  Movie };
const items: BookOrMovie[] = await primsa.item.findMany({
   include: {
      book: true,
      movie: true,
      },
  })
```

We also included a complete example [here](https://github.com/AmaniEzz/union-type-prisma/tree/master/solution1) on how to use **Multiple Foreign keys approach** to work around the Prisma lack of union type support with a **GraphQL** layer that contains actual union types. 

---

### 2) Single Polymorphic Association Table
Since Prisma doens't support Polymorphic Associations, another **_work around_** is to take care of the polymorphic relationship management in the application layer:

```typescript

model Book {
  id           String @id @unique()
  title        String
  serialNumber Int 
  // Prisma lacks support for polymorphic relations and union types
  // items Tag[]

model Movie {
  id       String @id @unique()
  title    String
  director String
  // Prisma lacks support for polymorphic relations and union types
  // items Tag[]
}

enum itemType {
  Book
  Movie
}

model Item {
  id        String        @id @unique()
  price     Int
  amount    Int
  ownerId   String        @unique
  itemType  itemType
}
```

then in the application layer we can query all items with their types like in the code below. However, the serious limitation of this approach is th **N+1** query issue!

```typescript
  const generticItems: Item[] = await db.item.findMany();

  // Limitations of this approach: n+1 problem
  const result = await Promise.all(
    generticItems.map(async (genericItem) => {
      // @ts-ignore
      const specificItem = await db[genericItem.itemType].findFirstOrThrow({
        where: { id: genericItem.ownerId },
      });
      return { ...genericItem, ...specificItem };
    })
  );
```

You can find the complete example [here](https://github.com/AmaniEzz/union-type-prisma/tree/master/solution2) on how to use  **Single Polymorphic Association Table** approach to work with union types in TypeScript when using Prisma to query a relational database. The example also include **GraphQL** schema that contain union types and resolvers to resolve each type. 

---
