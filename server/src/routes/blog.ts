import { PrismaClient } from "@prisma/client/extension";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";


export const blogRouter = new Hono<{
    Bindings : {
        DATABASE_URL : string,
        JWT_SECRET : string
    } ,
    Variables : {
        userId : string
    }
}>();


blogRouter.use("/*" , async (c , next) => {
    const jwt = c.req.header('Authorization');
    if (!jwt) {
        c.status(401);
        return c.json({error: "Unauthorized"});
    }

    const token = jwt.split(' ')[1];
    const payload = await verify(token , c.env.JWT_SECRET);
    if(!payload) {
        c.status(401);
        return c.json({error: "Unauthorized"});
    }
    c.set('userId' , String(payload.id))
    await next()
})

blogRouter.get("/:id" , (c) => {
  const id = c.req.param("id")
  console.log(id);
  return c.text("get blog route")
})

blogRouter.post("/" , async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = c.get("userId")
    const body = await c.req.json();
    const post = await prisma.post.create({
        data : {
            title : body.title,
            content : body.content ,
            authorId : userId
        }
    });
    return c.json({
        id:post.id
    })
})

blogRouter.put("/" ,async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = c.get("userId")
    const body = await c.req.json();
    prisma.post.update({
        where : {
            id : body.id,
            authorId : userId
        } , 
        data : {
            title : body.title,
            content : body.content
        }
    })

    return c.text("upload post")
})

blogRouter.get("/bulk" , (c) => {
  return c.text("Hello Hono")
})