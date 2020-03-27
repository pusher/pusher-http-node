# To release the library

1. Merge, and move to `master`
1. Update the CHANGELOG.md with the next release number and date. Commit it.
1. Run `npm version <patch|minor|major>` depending on the type of release.
   This will bump the version in `package.json` and create a tag and commit.
1. Push master and the tag: `git push; git push origin v<release number>`
1. Cut a release in Github, using the tag you just pushed and copying the
   approprate section of the changelog.
1. Ensure you are logged in to npm as `pusherapp` user, password in the vault.
   Use `npm login` if you're not sure.
1. Double check that there is nothing uncommitted or untracked in your working
   copy. *npm publishes the entire contents of the directory, uncommited,
   untracked, gitignored or otherwise, temporary files, credentials and all!*
1. `npm publish`.
