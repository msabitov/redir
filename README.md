# Redir - redirect extension

This extension provides a way to configure redirects in browser.

It's based on Manifest V3.

Currently, only Chrome / Yandex browser supported.

## Quick start

I recommend you to start from creation of simple redirect rules. They can be of two types

- Wildcard
- Regexp (RE2 syntax)

Regexp rules has two important limitation:
- the total number of regular expression rules cannot exceed 1000;
- each rule must be less than 2KB once compiled.

Don`t about the second one - once you try to save it, Redir will warn to prevent saving incorrect rules. So you can split you rule to multiple simpliest version and then combine them into rulesets.

Rulset is an arbitrary set of two or more rules that you can use to simplify your tasks. Ruleset can enable, disable and mark containing rules.

## Advanced use

If you are looking for tools to analyze what kind of requests are matching your rules you need to install unpacked version of this extension that is in **dist** directory.

In Redir devtools panel you can explore matched requests.
