// const fs = require('fs');

class Utils {
    static makeid (length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    //  static async deleteFile (filePath)  {
    //     try {
    //         await fs.unlink(filePath);
    //         console.log(`File ${filePath} deleted successfully`);
    //     } catch (error) {
    //         console.error(`Error deleting file ${filePath}:`, error);
    //     }
    // }
}


// export default Utils;
module.exports = Utils;