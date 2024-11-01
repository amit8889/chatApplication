
const createLiveTable =async(pool)=>{
    try {        
       const query = `CREATE TABLE IF NOT EXISTS liveUser (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(20) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            status ENUM('ONLINE', 'OFFLINE') DEFAULT 'OFFLINE',
            socketId VARCHAR(100) UNIQUE NOT NULL
        )`
         if(pool){
            const [result] = await pool.query(query)
            console.log("table created affacted rows : ",result.affectedRows)
         }
    } catch (error) {
        console.log(error)
        
    }
}
module.exports =  {createLiveTable}