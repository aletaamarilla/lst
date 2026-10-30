import {createSiteServer,readLocalPreview} from '../../../scripts/serve.mjs';
const previewTrips=await readLocalPreview();
createSiteServer({previewTrips}).listen(40091,'127.0.0.1',()=>console.log('Preview http://localhost:40091'));
