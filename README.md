# CAD VSCode Extension
This is an add-on for VSCode implementing some tools for the Collider-Accelerator Department's Controls group at Brookhaven Lab.

This extension interfaces with an in-house devops tool called caddy, written in Python, to manager the developer release process.

The tool provides two functions: 
1. A semantic release helper which increments the project version, pushes a tag to Gitlab, and kicks off the CI/CD release pipeline, and 
2. A project template helper to allow developers to migrate projects to the latest version of the standard template for a given project type.

Both of these functions are exposed as VSCode commands, accessible through the command palette. These commands also interact with the VSCode UI elements to prompt user choices and inform users of status updates and errors.

This tool is used extensively by the software group for management of Python application and library development workflows.