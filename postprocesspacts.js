import fs from 'fs';

/**
 * pact-js beta.58 generates incorrect query generators so this is a postfix routine.
 */
const PACT_DIR = './pacts';

fs.readdir(PACT_DIR, (_err, files) => {
  console.log('Starting pact rewriting...');
  files.forEach(file => {
    console.log(`Processing ${file} ...`);
    const filePath = `${PACT_DIR}/${file}`;
    const jsonString = fs.readFileSync(filePath, 'utf8').toString();
    const pact = JSON.parse(jsonString);
    let numMods = 0;
    pact.interactions.forEach(i => {
      const generators = i.request?.generators;

      if (generators?.query) {
        Object.getOwnPropertyNames(generators.query).forEach(p => {
          // Instead of e.g. "id", we are getting "$.id[0]", so fix it
          const newKey = p.replace(/\$\.(.+)\[0]/, '$1')
          generators.query[newKey] = generators.query[p];
          delete generators.query[p];
          numMods++;
        });
      }
    });
    fs.writeFileSync(filePath, JSON.stringify(pact, undefined,  2));
    console.log(`Finished processing ${file}: ${numMods} adjustments made`);
  });
  console.log('Pact rewriting finished');
});
