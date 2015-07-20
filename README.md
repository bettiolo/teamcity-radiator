teamcity-radiator
=================

Radiator for TeamCity broken builds. Shows failing and claimed builds.

Call example: `http://localhost/{teamcity-hostname}/{project-group-id}`

Where:
* `teamcity-hostname`: full hostname of your Teamcity server, eg "teamcity.mydomain.com"
* `project-group-id`: The Project ID from Teamcity for the project group you want monitored (available from Teamcity version 8+). eg "SearchTeam".

Optional querystring parameters:
* `projectDisplayNameToStrip`: Normally projects are displayed in the "Project Display Name :: Build Name" syntax. If the leading part is always the same and you want to hide it, you can pass it in here, in a URL encoded format. For example, your project group display name might be "Search Team", but the ID might be "SearchTeam" (no space). You can hide the leading part via: `http://localhost/{teamcity-hostname}/SearchTeam?projectDisplayNameToStrip=Search%20Team`.
* `successView`: When no builds are failing, the default view is a thumbs up image. This can be overriden to other views: "cats" shows random images of cats and "image" can display any image, the URL of which should be passed in via the "imageUrl" querystring parameter.

Heavily blurred screenshot:
![Screenshot](docs/teamcity-radiator.png?raw=true "Screenshot")
