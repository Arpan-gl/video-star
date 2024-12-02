const asyncHandler= (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=> next(err))
    }
}

export {asyncHandler}

/*
const asyncHandler = (func)=> async (req,res,next)=>{     // asynchandler = (func) => {async (req,res,next)=>{}}
    try {
        await func(req,res,next);
    } catch (error) {
        res.status(err.code || 500).json({
            message: err.message,
            success: false
        });
    }
}

||

const asyncHandler = (func) =>{
    return async (req,res,next)=>{
        try {
            await func(req,res,next);
        } catch (error) {
            res.status(error.code || 500).json({
                message: error.message,
                success: false
            });
        }
    }
}
*/