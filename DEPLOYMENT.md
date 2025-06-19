# GitHub Pages Deployment Instructions

## Setup Steps

1. **Create/Fork Repository**
   - Fork this repository or create a new one on GitHub
   - Clone to your local machine

2. **Update Configuration**
   - Edit `package.json` and replace `YOUR_USERNAME` with your GitHub username:
     ```json
     "repository": {
       "url": "https://github.com/YOUR_USERNAME/zoho_journey_showcase.git"
     },
     "homepage": "https://YOUR_USERNAME.github.io/zoho_journey_showcase/"
     ```

3. **Enable GitHub Pages**
   - Go to your repository settings on GitHub
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

4. **Deploy**
   - Push your changes to the main/master branch
   - GitHub Actions will automatically build and deploy
   - Your site will be available at: `https://YOUR_USERNAME.github.io/zoho_journey_showcase/`

## Files Created for GitHub Pages

- `.github/workflows/deploy.yml` - GitHub Actions workflow for automated deployment
- `.nojekyll` - Tells GitHub Pages not to use Jekyll processing
- Updated `package.json` with proper repository and homepage URLs
- Fixed relative paths in JavaScript files

## Workflow Process

The GitHub Actions workflow:
1. Checks out the code
2. Sets up Python environment
3. Processes email templates using `scripts/process_templates.py pm`
4. Deploys the `website/` directory to GitHub Pages

## Customization

To deploy with a different repository name:
1. Update the `homepage` URL in `package.json`
2. Ensure all relative paths in the code remain relative (no leading slashes)

## Troubleshooting

- **Site not loading**: Check that GitHub Pages is enabled and source is set to "GitHub Actions"
- **Missing content**: Ensure the workflow ran successfully in the Actions tab
- **404 errors**: Verify all file paths are relative and case-sensitive
