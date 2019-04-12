workflow "Autorebase on merge commits" {
  on = "push"
  resolves = ["docker://ljharb/rebase:latest"]
}

action "docker://ljharb/rebase:latest" {
  uses = "docker://ljharb/rebase:latest"
  secrets = ["GITHUB_TOKEN"]
}
