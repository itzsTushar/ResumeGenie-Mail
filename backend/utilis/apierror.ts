class ApiError extends Error {
	public statusCode : number;
	public data : null;
	public errors : unkonwn[];
	public success : boolean;
	
	constructor(
		statusCode:number,
		message: string = "Something Went Wrong",
		errors : string[] = [],
		stack?: string)
		{
		super(message);
		
		this.statusCode = statusCode;
		this.data = null;
		this.message = message;
		this.errors = errors;
		this.success = false;
		
		if(stack){
			this.stack = stack;
		}
		else {
			Error.captureStackTrace(this,this.constructor);
		}
	}
}

export { ApiError };
