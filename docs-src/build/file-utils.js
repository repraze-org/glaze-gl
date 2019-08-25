const path = require("path");
const fs = require("fs").promises;

const file = {
    exists: async function(destination){
        try{
            const stats = await fs.stat(destination);
            return stats.isFile();
        }catch(err){
            return false;
        }
    }
};

const directory = {
    exists: async function(){},
    copy:   async function(source, destination){
        const files = await fs.readdir(source);
        for(let i = 0; i < files.length; i++){
            const file = files[i];
            const sourceLocation = path.join(source, file);
            const destinationLocation = path.join(destination, file);
            const stats = await fs.stat(sourceLocation);
            if(stats.isDirectory()){
                await fs.mkdir(destinationLocation);
                await directory.copy(sourceLocation, destinationLocation);
            }else{
                await fs.copyFile(sourceLocation, destinationLocation);
            }
        }
    },
    empty: async function(destination){
        const files = await fs.readdir(destination);
        for(let i = 0; i < files.length; i++){
            const file = files[i];
            const location = path.join(destination, file);
            const stats = await fs.stat(location);
            if(stats.isDirectory()){
                await directory.empty(location);
                await fs.rmdir(location);
            }else{
                await fs.unlink(location);
            }
        }
    }
};

module.exports = {
    file,
    directory
};
