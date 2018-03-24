class DockerfileBuilder {
    constructor() {
        this.lines = [];
    }

    from(x) {
        this.lines.push(`FROM ${x}`);
        return this;
    }

    cmd(cmds) {
        this.lines.push(`CMD [ ${this.lines.map(line => `"${line}"`).join(', ')} ]`);
        return this;
    }

    copy(src, target) {
        this.lines.push(`COPY "${src}" "${target}`);
        return this;
    }

    run(x) {
        this.lines.push(`RUN ${x}`);
        return this;
    }

    expose(port) {
        this.lines.push(`EXPOSE ${port}`);
        return this;
    }

    workdir(dir) {
        this.lines.push(`WORKDIR ${dir}`);
        return this;
    }

    build() {
        return this.lines.join('\n');
    }
}

export default () => new DockerfileBuilder();