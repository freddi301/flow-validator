// @flow

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

type FileN = { type: 'file', name: string, path: string };
type DirN = { type: 'directory', name: string, path: string, files: {[key: string]: FileNode} };
type FileNode = FileN | DirN;

const buildFileTree = (filePath, fileName): FileNode => {
  if (!fs.statSync(path.join(filePath, fileName)).isDirectory()) {
    return ({ type: 'file', name: fileName, path: path.join(filePath, fileName) });
  }
  const tree: {[key: string]: FileNode} = {};
  fs.readdirSync(path.join(filePath, fileName)).forEach(file => {
    if (fs.statSync(path.join(filePath, fileName, file)).isDirectory()) {
      tree[file] = (buildFileTree(path.join(filePath, fileName), file));
    } else {
      tree[file] = ({ type: 'file', name: file, path: path.join(filePath, fileName, file) });
    }
  });
  return ({ type: 'directory', name: fileName, path: path.join(filePath, fileName), files: tree });
};

const tree = buildFileTree('./test/parse', 'simpleParse.js');

const getAsts = (files: FileNode): Array<{ path: string, ast: Object }> => {
  const asts = [];
  const getAst = (fn: FileNode) => {
    if (fn.type === 'file') asts.push({ path: fn.path, ast: JSON.parse(String(execSync(`\`npm bin\`/flow ast ${fn.path}`))) });
    if (fn.type === 'directory') { const dir: DirN = fn; Object.keys(dir.files).map(name => getAst(dir.files[name])); }
  };
  getAst(files);
  return asts;
};

const asts = getAsts(tree); // eslint-disable-line

// console.dir(asts, { depth: null, colors: true });