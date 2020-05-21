# quiz-decider
Decides the theme and person for the weekly quiz (Google Sheets Script)

Runs as a Google Sheets Script and posts to Slack using the WebHookURL (needs to be added for it to work).

Needs:
- a sheet called 'people' and a list of people to do the quiz.
- a sheet called 'themes' with a list of quiz themes
- a sheet called 'decided' where the list of quizzes are recorded.

showLatestQuiz() - shows the latest quiz
setQuiz() - sets the quiz if it's after 4pm on Friday and no quiz has been set for the following week, otherwise, tells you when you can set a new quiz.

If someone did the quiz for one week, they won't be chosen for the next week.
Themes will be randomly chosen for any that have not already been done.

Errors will be returned if there are no available people or themes.
