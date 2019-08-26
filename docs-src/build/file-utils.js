const path = require("path");
const fs = require("fs").promises;

class File{
    static async exists(destination){
        try{
            const stats = await fs.stat(destination);
            return stats.isFile();
        }catch(err){
            return false;
        }
    }
}

class Directory{
    static async exists(destination){
        try{
            const stats = await fs.stat(destination);
            return stats.isDirectory();
        }catch(err){
            return false;
        }
    }
    static async copy(source, destination){
        const files = await fs.readdir(source);
        for(let i = 0; i < files.length; i++){
            const file = files[i];
            const sourceLocation = path.join(source, file);
            const destinationLocation = path.join(destination, file);
            const stats = await fs.stat(sourceLocation);
            if(stats.isDirectory()){
                await fs.mkdir(destinationLocation);
                await Directory.copy(sourceLocation, destinationLocation);
            }else{
                await fs.copyFile(sourceLocation, destinationLocation);
            }
        }
    }
    static async empty(destination){
        const files = await fs.readdir(destination);
        for(let i = 0; i < files.length; i++){
            const file = files[i];
            const location = path.join(destination, file);
            const stats = await fs.stat(location);
            if(stats.isDirectory()){
                await Directory.empty(location);
                await fs.rmdir(location);
            }else{
                await fs.unlink(location);
            }
        }
    }
}

module.exports = {
    File,
    Directory
};
