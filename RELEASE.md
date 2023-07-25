If first time need to install
```bash
pip install build twine
```

# To build 
```bash
npm run build
python -m build
```

# To release
To pypi
```bash
twine upload dist/*
```

To npm

```bash
npm login
npm publish --access public
```

