
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
const Books = () => {
    const [books,setBooks] = useState([])
    
    useEffect(()=>{
        const fetchAllBooks = async ()=>{
            try{
                const res = await axios.get("http://localhost:8800/books")
                setBooks(res.data)

            }catch(err){
                console.log(err)
            }
        }
        fetchAllBooks()

    },[])

    const handleDelete = async (idbooks) =>{
        try{
            await axios.delete("http://localhost:8800/books/"+idbooks)
            window.location.reload()
        }catch(err){
            console.log(err)
        }
    }
    return (
    <div>
        <h1>Books Shop</h1>
        <div className="books">
            {books.map(book=>(
                <div className="book" key={book.idbooks}>
                    {book.cover&& <img src={book.cover} alt=""/>}
                    <h2>{book.title}</h2>
                    <p>{book.desc}</p>
                    <span>{book.price}</span>
                    <button className="delete" onClick={()=>handleDelete(book.idbooks)}>Delete</button>
                    <button className="update"><Link to={`/Update/${book.idbooks}`}>Update</Link></button>
                </div>
            ))}
        </div>
        <button><Link to={"/Add"}>Add Books</Link></button>
    </div>
  )
}

export default Books