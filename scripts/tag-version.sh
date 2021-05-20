
#!/env bash

function version_gt() { test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"; }

PACKAGE_NAME=$(cat package.json | grep \\\"name\\\" | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]') 
CURRENT_VERSION=$(npm show "$PACKAGE_NAME" version)
NEXT_PACKAGE_VERSION=$(cat package.json | grep \\\"version\\\" | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]') 

if ! version_gt $NEXT_PACKAGE_VERSION $CURRENT_VERSION; then
     echo "🔴 Version mismatch"
     echo "The current version of the package is not greater than what is in package.json"
     echo "Aborting"
     exit 1
fi


echo "$PACKAGE_NAME"
echo "$CURRENT_VERSION"
echo "$NEXT_PACKAGE_VERSION"


echo "🔖 Creating tag for \"$PACKAGE_VERSION\""
git add .
git commit -m "🔖 Bump version /"$PACKAGE_VERSION/""
git tag $PACKAGE_VERSION 
git push --tags
git push