import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute } from 'react-router'
import createHistory from 'history/lib/createBrowserHistory'
import useQueries from 'history/lib/useQueries'
import useBasename from 'history/lib/useBasename'

import PathResolve from "./path_resolve.js"

import Loader from "./loader.jsx"
import Overview from "./overview.jsx"
import Source from "./source.jsx"

import Metrics from "./modules/metrics.jsx"
import Dependencies from "./modules/dependencies.jsx"
import PHPMD from "./modules/phpmd.jsx"
import Tests from "./modules/tests.jsx"
import Checkstyle from "./modules/checkstyle.jsx"
import CPD from "./modules/cpd.jsx"
import PhpLoc from "./modules/phploc.jsx"

import Navigation from "./bootstrap/navigation.jsx"

let App = React.createClass({
    propTypes: {
        routes: React.PropTypes.array,
        children: React.PropTypes.object,
        location: React.PropTypes.object.isRequired,
        params: React.PropTypes.object,
    },

    getInitialState: function () {
        return {
            initialized: false,
            data: {
                analyzers: {},
            },
        }
    },

    navigation: [
        {
            path: "source",
            name: "Source",
            icon: "glyphicon glyphicon-folder-open",
        },
        {
            name: "Metrics",
            icon: "glyphicon glyphicon-scale",
            children: [
                {
                    path: "phploc",
                    name: "Size",
                    icon: "glyphicon glyphicon-scale",
                    analyzer: true,
                },
                {
                    path: "pdepend",
                    name: "Metrics",
                    icon: "glyphicon glyphicon-stats",
                    analyzer: true,
                },
                {
                    path: "dependencies",
                    name: "Dependencies",
                    icon: "glyphicon glyphicon-retweet",
                    analyzer: true,
                },
            ],
        },
        {
            name: "Reports",
            icon: "glyphicon glyphicon-list-alt",
            children: [
                {
                    path: "phpmd",
                    name: "Mess Detector",
                    icon: "glyphicon glyphicon-trash",
                    analyzer: true,
                },
                {
                    path: "tests",
                    name: "Tests",
                    icon: "glyphicon glyphicon-thumbs-up",
                    analyzer: true,
                },
                {
                    path: "checkstyle",
                    name: "Checkstyle",
                    icon: "glyphicon glyphicon-erase",
                    analyzer: true,
                },
                {
                    path: "cpd",
                    name: "Copy & Paste",
                    icon: "glyphicon glyphicon-duplicate",
                    analyzer: true,
                },
            ],
        },
    ],

    setInitialized: function (data) {
        this.setState({
            initialized: true,
            data: data,
        })
    },

    render: function () {
        if (!this.state.initialized) {
            return (<div className="container">
                <Loader onComplete={this.setInitialized} />
            </div>)
        }

        var data = this.state.data

        for (var i = 0; i < this.navigation.length; ++i) {
            if (!this.navigation[i].analyzer ||
                data.analyzers[this.navigation[i].path]) {
                this.navigation[i].enabled = true
            }

            if ('children' in this.navigation[i]) {
                for (var j = 0; j < this.navigation[i].children.length; ++j) {
                    if (!this.navigation[i].children[j].analyzer ||
                        data.analyzers[this.navigation[i].children[j].path]) {
                        this.navigation[i].children[j].enabled = true
                    }
                }
            }
        }

        return (<div className="loaded">
            <Navigation brand="Quality Analyzer" brandLink="/" items={this.navigation} matched={this.props.routes[1] || null} />

            {!this.props.children ? '' :
            <div className="container">
                {React.cloneElement(
                    this.props.children,
                    { data: data, query: this.props.location.query, params: this.props.params }
                )}
            </div>}
        </div>)
    },
})

let resolver = new PathResolve()
let history = useBasename(useQueries(createHistory))({
    basename: resolver.getBasePath(window.location),
})

render(
    <Router history={history}>
        <Route path="/" component={App}>
            <IndexRoute component={Overview} />

            <Route name="source" path="source" component={Source} />
            <Route name="phploc" path="phploc" component={PhpLoc} />
            <Route name="pdepend" path="pdepend" component={Metrics} />
            <Route name="dependencies" path="dependencies" component={Dependencies} />
            <Route name="phpmd" path="phpmd" component={PHPMD} />
            <Route name="tests" path="tests" component={Tests} />
            <Route name="checkstyle" path="checkstyle" component={Checkstyle} />
            <Route name="cpd" path="cpd" component={CPD} />

            <Route path="index.html" component={Overview} />
            <Route path="*" component={Overview} />
        </Route>
    </Router>,
    document.getElementById('content')
)
