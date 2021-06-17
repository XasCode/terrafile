import Git from 'src/backend/moduleSources/common/git';

const acceptable = [`comment`, `source`, `version`, `path`];
const matchStart = `https://`;
const sourceType = `gitHttps`;

const git = Git(acceptable, matchStart, sourceType);

export default { ...git };
