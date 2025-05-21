<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
  <xsl:template match="/">
    <html>
      <head>
        <title>University Student Database</title>
        <link rel="stylesheet" href="students.css" type="text/css" />
      </head>
      <body>
        <h1>Student Information System</h1>
        <div class="faculty">
          <h2><xsl:value-of select="university/faculty/n"/></h2>
          <xsl:for-each select="university/faculty/department">
            <div class="department">
              <h3><xsl:value-of select="n"/></h3>
              <xsl:for-each select="course">
                <div class="course">
                  <h4>Course <xsl:value-of select="number"/></h4>
                  <table border="1" cellspacing="0" cellpadding="5">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Age</th>
                        <th>GPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <xsl:for-each select="student">
                        <tr>
                          <td class="id"><xsl:value-of select="id"/></td>
                          <td class="name"><xsl:value-of select="full_name"/></td>
                          <td class="age"><xsl:value-of select="age"/></td>
                          <td class="gpa"><xsl:value-of select="gpa"/></td>
                        </tr>
                      </xsl:for-each>
                    </tbody>
                  </table>
                </div>
              </xsl:for-each>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>