import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { prismaClient } from '@repo/db/client';
import { playerSchema } from './types';
import bcrypt from 'bcrypt';

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

app.post("/signup", async (req, res) =>  {
  const parsedData = playerSchema.safeParse(req.body);
  
  if(!parsedData.success){
    res.json({
      message: "Incorrect inputs"
    })
    return;
  };

  try{
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 5);

    const user = await prismaClient.player.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword
      }
    })

    res.json({
      message: "Signed up"
    })

  } catch(e) {
    console.log(`${e}`);
    res.status(411).json({
      message: "Failed to signup"
    })
  }
})

app.post("/signin", async(req, res) => {

  const parsedData = playerSchema.safeParse(req.body)
  if(!parsedData.success){
    res.status(400).json({
      message: "Invalid inputs"
    });
    return;
  }
  if(typeof parsedData.data.password != "string"){
    return
  }

  try{
    const user = await prismaClient.player.findFirst({
      where: {
        username: parsedData.data.username 
      },
      select: {
        id: true,
        username: true,
        password: true
      }
    })
    if(!user){
      res.status(401).json({ message: "Invalid credentials" });
      return
    }
    
    const comparePassword = await bcrypt.compare(parsedData.data.password, user.password)
    
    if(!comparePassword){
      res.status(401).json({ message: "Invalid credentials" })
      return
    }

    const userId = user.id
    const token = jwt.sign({
      userId,
      username: user.username
    }, JWT_SECRET as string)

    res.json({
      token,
      userId,
      username: user.username
    })

  } catch(e){
    res.status(500).json({ message: "Internal server error" })
  }
})

app.get("/leaderBoard", async (req, res) => {
  try{
    const leaderBoard = await prismaClient.player.findMany({
      select: {
        id: true,
        username: true,
        points: true
      },
      orderBy: {
        points: "desc",
      }
    });

    res.json({
      leaderBoard
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Error fetching leader board"
    })
  }
  
})

app.listen(3001);