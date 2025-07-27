# First check if upstream remote exists
$upstream = git remote -v | Select-String "upstream"

if ($upstream) {
    Write-Host "Removing existing upstream remote..."
    git remote remove upstream
}

# Add the new upstream remote
Write-Host "Adding new upstream remote..."
git remote add upstream https://github.com/gurramkarthiknetha/key-management.git

# Verify the remote was added
Write-Host "Verifying remotes..."
git remote -v

# Try to fetch from upstream
Write-Host "Attempting to fetch from upstream..."
git fetch upstream
