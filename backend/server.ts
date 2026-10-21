import app from "./app.ts";
import "dotenv/config";
const PORT = Number(process.env.PORT) || 7000;

app.listen(PORT,()=>{
	console.log(`Server running at http://localhost:${PORT}`);
	});
