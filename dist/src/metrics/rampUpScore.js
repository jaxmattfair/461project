export function analyzeReadme(content) {
    const metrics = {
        essentialSections: {
            introduction: false,
            installation: false,
            usage: false,
            contributing: false,
            license: false,
        },
        codeBlocks: 0,
        links: 0,
    };
    function traverse(node) {
        switch (node.type) {
            case 'heading':
                const title = toString(node).toLowerCase();
                if (title.includes('introduction'))
                    metrics.essentialSections.introduction = true;
                if (title.includes('installation'))
                    metrics.essentialSections.installation = true;
                if (title.includes('usage'))
                    metrics.essentialSections.usage = true;
                if (title.includes('contributing'))
                    metrics.essentialSections.contributing = true;
                if (title.includes('license'))
                    metrics.essentialSections.license = true;
                break;
            case 'code':
                metrics.codeBlocks += 1;
                break;
            case 'link':
                metrics.links += 1;
                break;
            default:
                break;
        }
        if (node.children) {
            for (const child of node.children) {
                traverse(child);
            }
        }
    }
    traverse(content);
    return metrics;
}
