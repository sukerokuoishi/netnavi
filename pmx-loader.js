/**
 * PMX Model Loader for Babylon.js
 * Loads PMX files and converts them to Babylon.js format
 */

class PMXLoader {
    constructor(scene) {
        this.scene = scene;
        this.textDecoder = new TextDecoder('utf-8');
    }
    
    async loadPMX(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const dataView = new DataView(arrayBuffer);
            
            const pmxData = this.parsePMX(dataView);
            return this.createBabylonMesh(pmxData);
        } catch (error) {
            console.error('PMX loading error:', error);
            throw error;
        }
    }
    
    parsePMX(dataView) {
        let offset = 0;
        
        // PMXヘッダー
        const header = this.readPMXHeader(dataView, offset);
        offset = header.offset;
        
        // モデル情報
        const modelInfo = this.readModelInfo(dataView, offset, header.encoding);
        offset = modelInfo.offset;
        
        // 頂点データ
        const vertices = this.readVertices(dataView, offset, header);
        offset = vertices.offset;
        
        // 面データ
        const faces = this.readFaces(dataView, offset, header);
        offset = faces.offset;
        
        // テクスチャ
        const textures = this.readTextures(dataView, offset, header.encoding);
        offset = textures.offset;
        
        // マテリアル
        const materials = this.readMaterials(dataView, offset, header);
        offset = materials.offset;
        
        // ボーン
        const bones = this.readBones(dataView, offset, header);
        offset = bones.offset;
        
        return {
            header,
            modelInfo: modelInfo.data,
            vertices: vertices.data,
            faces: faces.data,
            textures: textures.data,
            materials: materials.data,
            bones: bones.data
        };
    }
    
    readPMXHeader(dataView, offset) {
        // PMX magic number
        const magic = this.readString(dataView, offset, 4);
        offset += 4;
        
        if (magic !== 'PMX ') {
            throw new Error('Invalid PMX file format');
        }
        
        // バージョン
        const version = dataView.getFloat32(offset, true);
        offset += 4;
        
        // フラグ数
        const flagCount = dataView.getUint8(offset);
        offset += 1;
        
        // フラグ配列
        const flags = new Uint8Array(dataView.buffer, offset, flagCount);
        offset += flagCount;
        
        return {
            magic,
            version,
            encoding: flags[0], // 0: UTF16, 1: UTF8
            additionalUV: flags[1],
            vertexIndexSize: flags[2],
            textureIndexSize: flags[3],
            materialIndexSize: flags[4],
            boneIndexSize: flags[5],
            morphIndexSize: flags[6],
            rigidBodyIndexSize: flags[7],
            offset
        };
    }
    
    readModelInfo(dataView, offset, encoding) {
        const modelName = this.readText(dataView, offset, encoding);
        offset = modelName.offset;
        
        const modelNameEn = this.readText(dataView, offset, encoding);
        offset = modelNameEn.offset;
        
        const comment = this.readText(dataView, offset, encoding);
        offset = comment.offset;
        
        const commentEn = this.readText(dataView, offset, encoding);
        offset = commentEn.offset;
        
        return {
            data: {
                name: modelName.text,
                nameEn: modelNameEn.text,
                comment: comment.text,
                commentEn: commentEn.text
            },
            offset
        };
    }
    
    readVertices(dataView, offset, header) {
        const vertexCount = dataView.getUint32(offset, true);
        offset += 4;
        
        const vertices = [];
        
        for (let i = 0; i < vertexCount; i++) {
            const vertex = {
                position: [
                    dataView.getFloat32(offset, true),
                    dataView.getFloat32(offset + 4, true),
                    dataView.getFloat32(offset + 8, true)
                ],
                normal: [
                    dataView.getFloat32(offset + 12, true),
                    dataView.getFloat32(offset + 16, true),
                    dataView.getFloat32(offset + 20, true)
                ],
                uv: [
                    dataView.getFloat32(offset + 24, true),
                    dataView.getFloat32(offset + 28, true)
                ]
            };
            
            offset += 32; // 基本的な頂点データサイズ
            
            // 追加UVの処理
            if (header.additionalUV > 0) {
                vertex.additionalUV = [];
                for (let j = 0; j < header.additionalUV; j++) {
                    vertex.additionalUV.push([
                        dataView.getFloat32(offset, true),
                        dataView.getFloat32(offset + 4, true),
                        dataView.getFloat32(offset + 8, true),
                        dataView.getFloat32(offset + 12, true)
                    ]);
                    offset += 16;
                }
            }
            
            // ウェイトタイプ
            const weightType = dataView.getUint8(offset);
            offset += 1;
            
            vertex.weightType = weightType;
            vertex.weights = this.readWeights(dataView, offset, weightType, header.boneIndexSize);
            offset = vertex.weights.offset;
            
            // エッジ倍率
            vertex.edgeSize = dataView.getFloat32(offset, true);
            offset += 4;
            
            vertices.push(vertex);
        }
        
        return { data: vertices, offset };
    }
    
    readWeights(dataView, offset, weightType, boneIndexSize) {
        const weights = { bones: [], weights: [] };
        
        switch (weightType) {
            case 0: // BDEF1
                weights.bones.push(this.readIndex(dataView, offset, boneIndexSize));
                offset += boneIndexSize;
                weights.weights.push(1.0);
                break;
                
            case 1: // BDEF2
                weights.bones.push(this.readIndex(dataView, offset, boneIndexSize));
                offset += boneIndexSize;
                weights.bones.push(this.readIndex(dataView, offset, boneIndexSize));
                offset += boneIndexSize;
                
                const weight1 = dataView.getFloat32(offset, true);
                offset += 4;
                weights.weights.push(weight1, 1.0 - weight1);
                break;
                
            case 2: // BDEF4
                for (let i = 0; i < 4; i++) {
                    weights.bones.push(this.readIndex(dataView, offset, boneIndexSize));
                    offset += boneIndexSize;
                }
                for (let i = 0; i < 4; i++) {
                    weights.weights.push(dataView.getFloat32(offset, true));
                    offset += 4;
                }
                break;
                
            case 3: // SDEF
                for (let i = 0; i < 2; i++) {
                    weights.bones.push(this.readIndex(dataView, offset, boneIndexSize));
                    offset += boneIndexSize;
                }
                weights.weights.push(dataView.getFloat32(offset, true));
                offset += 4;
                weights.weights.push(1.0 - weights.weights[0]);
                
                // SDEF用の追加パラメータ
                weights.sdefC = [
                    dataView.getFloat32(offset, true),
                    dataView.getFloat32(offset + 4, true),
                    dataView.getFloat32(offset + 8, true)
                ];
                offset += 12;
                
                weights.sdefR0 = [
                    dataView.getFloat32(offset, true),
                    dataView.getFloat32(offset + 4, true),
                    dataView.getFloat32(offset + 8, true)
                ];
                offset += 12;
                
                weights.sdefR1 = [
                    dataView.getFloat32(offset, true),
                    dataView.getFloat32(offset + 4, true),
                    dataView.getFloat32(offset + 8, true)
                ];
                offset += 12;
                break;
        }
        
        return { ...weights, offset };
    }
    
    readFaces(dataView, offset, header) {
        const faceCount = dataView.getUint32(offset, true);
        offset += 4;
        
        const faces = [];
        
        for (let i = 0; i < faceCount; i += 3) {
            const face = [
                this.readIndex(dataView, offset, header.vertexIndexSize),
                this.readIndex(dataView, offset + header.vertexIndexSize, header.vertexIndexSize),
                this.readIndex(dataView, offset + header.vertexIndexSize * 2, header.vertexIndexSize)
            ];
            faces.push(face);
            offset += header.vertexIndexSize * 3;
        }
        
        return { data: faces, offset };
    }
    
    readTextures(dataView, offset, encoding) {
        const textureCount = dataView.getUint32(offset, true);
        offset += 4;
        
        const textures = [];
        
        for (let i = 0; i < textureCount; i++) {
            const texture = this.readText(dataView, offset, encoding);
            textures.push(texture.text);
            offset = texture.offset;
        }
        
        return { data: textures, offset };
    }
    
    readMaterials(dataView, offset, header) {
        const materialCount = dataView.getUint32(offset, true);
        offset += 4;
        
        const materials = [];
        
        for (let i = 0; i < materialCount; i++) {
            const material = {};
            
            // 材質名
            const name = this.readText(dataView, offset, header.encoding);
            material.name = name.text;
            offset = name.offset;
            
            const nameEn = this.readText(dataView, offset, header.encoding);
            material.nameEn = nameEn.text;
            offset = nameEn.offset;
            
            // 拡散色
            material.diffuse = [
                dataView.getFloat32(offset, true),
                dataView.getFloat32(offset + 4, true),
                dataView.getFloat32(offset + 8, true),
                dataView.getFloat32(offset + 12, true)
            ];
            offset += 16;
            
            // 鏡面色
            material.specular = [
                dataView.getFloat32(offset, true),
                dataView.getFloat32(offset + 4, true),
                dataView.getFloat32(offset + 8, true)
            ];
            offset += 12;
            
            // 鏡面係数
            material.specularPower = dataView.getFloat32(offset, true);
            offset += 4;
            
            // 環境色
            material.ambient = [
                dataView.getFloat32(offset, true),
                dataView.getFloat32(offset + 4, true),
                dataView.getFloat32(offset + 8, true)
            ];
            offset += 12;
            
            // 描画フラグ
            material.flag = dataView.getUint8(offset);
            offset += 1;
            
            // エッジ色
            material.edgeColor = [
                dataView.getFloat32(offset, true),
                dataView.getFloat32(offset + 4, true),
                dataView.getFloat32(offset + 8, true),
                dataView.getFloat32(offset + 12, true)
            ];
            offset += 16;
            
            // エッジサイズ
            material.edgeSize = dataView.getFloat32(offset, true);
            offset += 4;
            
            // テクスチャインデックス
            material.textureIndex = this.readIndex(dataView, offset, header.textureIndexSize);
            offset += header.textureIndexSize;
            
            // スフィアテクスチャインデックス
            material.sphereTextureIndex = this.readIndex(dataView, offset, header.textureIndexSize);
            offset += header.textureIndexSize;
            
            // スフィアモード
            material.sphereMode = dataView.getUint8(offset);
            offset += 1;
            
            // トゥーンフラグ
            material.toonFlag = dataView.getUint8(offset);
            offset += 1;
            
            if (material.toonFlag === 0) {
                // トゥーンテクスチャインデックス
                material.toonTextureIndex = this.readIndex(dataView, offset, header.textureIndexSize);
                offset += header.textureIndexSize;
            } else {
                // 共有トゥーンテクスチャ
                material.sharedToonTexture = dataView.getUint8(offset);
                offset += 1;
            }
            
            // メモ
            const memo = this.readText(dataView, offset, header.encoding);
            material.memo = memo.text;
            offset = memo.offset;
            
            // 面数
            material.faceCount = dataView.getUint32(offset, true);
            offset += 4;
            
            materials.push(material);
        }
        
        return { data: materials, offset };
    }
    
    readBones(dataView, offset, header) {
        const boneCount = dataView.getUint32(offset, true);
        offset += 4;
        
        const bones = [];
        
        for (let i = 0; i < boneCount; i++) {
            const bone = {};
            
            // ボーン名
            const name = this.readText(dataView, offset, header.encoding);
            bone.name = name.text;
            offset = name.offset;
            
            const nameEn = this.readText(dataView, offset, header.encoding);
            bone.nameEn = nameEn.text;
            offset = nameEn.offset;
            
            // 位置
            bone.position = [
                dataView.getFloat32(offset, true),
                dataView.getFloat32(offset + 4, true),
                dataView.getFloat32(offset + 8, true)
            ];
            offset += 12;
            
            // 親ボーンインデックス
            bone.parentIndex = this.readIndex(dataView, offset, header.boneIndexSize);
            offset += header.boneIndexSize;
            
            // 変形階層
            bone.layer = dataView.getUint32(offset, true);
            offset += 4;
            
            // ボーンフラグ
            bone.flag = dataView.getUint16(offset, true);
            offset += 2;
            
            // フラグに基づく追加データの読み込み
            // (簡略化のため基本的な読み込みのみ実装)
            
            bones.push(bone);
        }
        
        return { data: bones, offset };
    }
    
    createBabylonMesh(pmxData) {
        // 頂点データの変換
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        
        pmxData.vertices.forEach(vertex => {
            positions.push(...vertex.position);
            normals.push(...vertex.normal);
            uvs.push(vertex.uv[0], 1.0 - vertex.uv[1]); // V座標を反転
        });
        
        pmxData.faces.forEach(face => {
            indices.push(...face);
        });
        
        // メッシュ作成
        const mesh = new BABYLON.Mesh("pmxModel", this.scene);
        
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        vertexData.indices = indices;
        
        vertexData.applyToMesh(mesh);
        
        // マテリアル作成
        if (pmxData.materials.length > 0) {
            const multiMaterial = new BABYLON.MultiMaterial("pmxMultiMat", this.scene);
            
            pmxData.materials.forEach((matData, index) => {
                const material = new BABYLON.StandardMaterial(`pmxMat_${index}`, this.scene);
                material.diffuseColor = new BABYLON.Color3(
                    matData.diffuse[0],
                    matData.diffuse[1],
                    matData.diffuse[2]
                );
                material.specularColor = new BABYLON.Color3(
                    matData.specular[0],
                    matData.specular[1],
                    matData.specular[2]
                );
                material.specularPower = matData.specularPower;
                
                multiMaterial.subMaterials.push(material);
            });
            
            mesh.material = multiMaterial;
        }
        
        return mesh;
    }
    
    // ユーティリティメソッド
    
    readText(dataView, offset, encoding) {
        const length = dataView.getUint32(offset, true);
        offset += 4;
        
        if (length === 0) {
            return { text: '', offset };
        }
        
        let text;
        if (encoding === 0) { // UTF-16
            const textBytes = new Uint16Array(dataView.buffer, offset, length / 2);
            text = String.fromCharCode.apply(null, textBytes);
        } else { // UTF-8
            const textBytes = new Uint8Array(dataView.buffer, offset, length);
            text = this.textDecoder.decode(textBytes);
        }
        
        return { text, offset: offset + length };
    }
    
    readString(dataView, offset, length) {
        const bytes = new Uint8Array(dataView.buffer, offset, length);
        return String.fromCharCode.apply(null, bytes);
    }
    
    readIndex(dataView, offset, size) {
        switch (size) {
            case 1:
                return dataView.getUint8(offset);
            case 2:
                return dataView.getUint16(offset, true);
            case 4:
                return dataView.getUint32(offset, true);
            default:
                throw new Error(`Invalid index size: ${size}`);
        }
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PMXLoader;
} else if (typeof window !== 'undefined') {
    window.PMXLoader = PMXLoader;
}