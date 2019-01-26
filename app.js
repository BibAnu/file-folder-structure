const http = require('http');
const fs = require('fs');
const path = require('path');
const hostname = '127.0.0.1';
const port = 3000;
const { parse } = require('querystring');

const getFoldersAndFiles = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const dirFile = path.join(dir, file);
        const dirent = fs.statSync(dirFile);
        if (dirent.isDirectory()) {
            var odir = {
                folder: file,
                path: dirFile,
                inside: []
            }
            odir.inside = getFoldersAndFiles(dirFile, dir.files);
            filelist.push(odir);
        } else {
            filelist.push({
                file: file,
                path: dirFile
            });
        }
    }
    return filelist;
};

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        collectRequestData(req, result => {
            if (result.path) {
                let files = getFoldersAndFiles(result.path);
                res.end(JSON.stringify(files));
            } else {
                res.end('No path submitted');
            }
        });
    } else {
        res.end(`
        <!doctype html>
        <html>
        <body>
            <form action="/" method="post">
                <input placeholder="Please Enter Path" type="text" name="path" /><br />
                <button>Get folders</button>
            </form>
        </body>
        </html>
        `);
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if (request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}